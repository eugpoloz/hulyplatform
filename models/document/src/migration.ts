//
// Copyright © 2022-2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { type Attachment } from '@hcengineering/attachment'
import { type Class, type Doc, type Ref, TxOperations, DOMAIN_TX, getCollaborativeDoc } from '@hcengineering/core'
import { type Document } from '@hcengineering/document'
import {
  type MigrateOperation,
  type MigrationClient,
  type MigrationUpgradeClient,
  tryMigrate
} from '@hcengineering/model'
import { DOMAIN_ATTACHMENT } from '@hcengineering/model-attachment'
import core from '@hcengineering/model-core'
import document, { documentId, DOMAIN_DOCUMENT } from './index'

async function createSpace (tx: TxOperations): Promise<void> {
  const contacts = await tx.findOne(core.class.Space, {
    _id: document.space.Documents
  })
  if (contacts === undefined) {
    await tx.createDoc(
      core.class.Space,
      core.space.Space,
      {
        name: 'Documents',
        description: 'Documents',
        private: false,
        archived: false,
        members: []
      },
      document.space.Documents
    )
  }
}

async function migrateCollaborativeContent (client: MigrationClient): Promise<void> {
  const attachedFiles = await client.find<Attachment>(DOMAIN_ATTACHMENT, {
    _class: 'document:class:CollaboratorDocument' as Ref<Class<Doc>>,
    attachedToClass: document.class.Document
  })

  for (const attachment of attachedFiles) {
    const collaborativeDoc = getCollaborativeDoc(attachment._id)

    await client.update(
      DOMAIN_DOCUMENT,
      {
        _id: attachment.attachedTo,
        _class: attachment.attachedToClass,
        content: {
          $exists: false
        }
      },
      {
        $set: {
          content: collaborativeDoc
        }
      }
    )
  }

  // delete snapshots in old format
  await client.deleteMany(DOMAIN_DOCUMENT, {
    _class: 'document:class:DocumentSnapshot' as Ref<Class<Doc>>,
    contentId: { $exists: true }
  })

  await client.update(
    DOMAIN_DOCUMENT,
    {
      _class: document.class.Document,
      snapshots: { $gt: 0 }
    },
    {
      $set: {
        snapshots: 0
      }
    }
  )

  // delete old snapshot transactions
  await client.deleteMany(DOMAIN_TX, {
    _class: core.class.TxCollectionCUD,
    objectClass: document.class.Document,
    collection: 'snapshots'
  })
}

async function fixCollaborativeContentId (client: MigrationClient): Promise<void> {
  const documents = await client.find<Document>(DOMAIN_DOCUMENT, {
    content: { $exists: true }
  })

  // there was a wrong migration that assigned incorrect collaborative doc id
  for (const document of documents) {
    if (!document.content.includes(':')) {
      await client.update(DOMAIN_DOCUMENT, { _id: document._id }, { content: getCollaborativeDoc(document.content) })
    }
  }
}

async function migrateWrongDomainContent (client: MigrationClient): Promise<void> {
  // migrate content saved into wrong domain
  const attachedFiles = await client.find<Attachment>(DOMAIN_DOCUMENT, {
    _class: 'document:class:CollaboratorDocument' as Ref<Class<Doc>>,
    attachedToClass: document.class.Document
  })

  for (const attachment of attachedFiles) {
    const collaborativeDoc = getCollaborativeDoc(attachment._id)

    await client.update(
      DOMAIN_DOCUMENT,
      {
        _id: attachment.attachedTo,
        _class: attachment.attachedToClass,
        content: {
          $exists: false
        }
      },
      {
        $set: {
          content: collaborativeDoc
        }
      }
    )
  }

  await client.move(
    DOMAIN_DOCUMENT,
    {
      _class: 'document:class:CollaboratorDocument' as Ref<Class<Doc>>,
      attachedToClass: document.class.Document
    },
    DOMAIN_ATTACHMENT
  )
}

async function setNoParent (client: MigrationClient): Promise<void> {
  await client.update(
    DOMAIN_DOCUMENT,
    {
      _class: document.class.Document,
      attachedTo: { $exists: false }
    },
    {
      $set: {
        attachedTo: document.ids.NoParent,
        attachedToClass: document.class.Document
      }
    }
  )
  const docsWithParent = (await client.find(DOMAIN_DOCUMENT, {
    _class: document.class.Document,
    attachedTo: { $exists: true, $ne: document.ids.NoParent }
  })) as Document[]
  for (const doc of docsWithParent) {
    const parent = await client.find(DOMAIN_DOCUMENT, {
      _class: document.class.Document,
      _id: doc.attachedTo
    })
    if (parent.length === 0) continue
    if (parent[0].space !== doc.space) {
      await client.update(
        DOMAIN_DOCUMENT,
        {
          _class: document.class.Document,
          _id: doc._id
        },
        {
          $set: {
            attachedTo: document.ids.NoParent
          }
        }
      )
    }
  }

  await client.update(
    DOMAIN_DOCUMENT,
    {
      _class: document.class.Document,
      attachedTo: ''
    },
    {
      $set: {
        attachedTo: document.ids.NoParent
      }
    }
  )
}

export const documentOperation: MigrateOperation = {
  async migrate (client: MigrationClient): Promise<void> {
    await setNoParent(client)
    await tryMigrate(client, documentId, [
      {
        state: 'collaborativeContent',
        func: migrateCollaborativeContent
      },
      {
        state: 'fixCollaborativeContentId',
        func: fixCollaborativeContentId
      },
      {
        state: 'wrongDomainContent',
        func: migrateWrongDomainContent
      }
    ])
  },

  async upgrade (client: MigrationUpgradeClient): Promise<void> {
    const tx = new TxOperations(client, core.account.System)
    await createSpace(tx)
  }
}
