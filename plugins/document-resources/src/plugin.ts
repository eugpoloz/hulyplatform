//
// Copyright © 2022, 2023 Hardcore Engineering Inc.
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

import { type Doc } from '@hcengineering/core'
import document, { type Teamspace, documentId } from '@hcengineering/document'
import { type IntlString, type Resource, mergeIds } from '@hcengineering/platform'
import { type AnyComponent, type Location } from '@hcengineering/ui'

export default mergeIds(documentId, document, {
  component: {
    EditDoc: '' as AnyComponent,
    MyDocuments: '' as AnyComponent,
    NewDocumentHeader: '' as AnyComponent,
    Revision: '' as AnyComponent,
    CreateTeamspace: '' as AnyComponent
  },
  function: {
    GetDocumentLink: '' as Resource<(doc: Doc, props: Record<string, any>) => Promise<string>>,
    GetObjectLinkFragment: '' as Resource<(doc: Doc, props: Record<string, any>) => Promise<Location>>,
    IsTeamspaceVisible: '' as Resource<(space: Teamspace) => Promise<boolean>>
  },
  string: {
    DocumentNamePlaceholder: '' as IntlString,
    Name: '' as IntlString,
    Cancel: '' as IntlString,
    Documents: '' as IntlString,
    Document: '' as IntlString,
    SearchDocument: '' as IntlString,
    Version: '' as IntlString,
    Snapshot: '' as IntlString,
    NoVersions: '' as IntlString,
    NoBaseVersion: '' as IntlString,
    DocumentApplication: '' as IntlString,
    MyDocuments: '' as IntlString,
    Library: '' as IntlString,
    Teamspace: '' as IntlString,
    Teamspaces: '' as IntlString,
    Labels: '' as IntlString,
    Authors: '' as IntlString,
    Backlinks: '' as IntlString,
    History: '' as IntlString,
    SavedDocuments: '' as IntlString,
    AddLabel: '' as IntlString,
    NewTeamspace: '' as IntlString,
    CreateTeamspace: '' as IntlString,
    EditTeamspace: '' as IntlString,
    TeamspaceTitle: '' as IntlString,
    TeamspaceMembers: '' as IntlString,
    TeamspaceTitlePlaceholder: '' as IntlString,
    TeamspaceDescriptionPlaceholder: '' as IntlString,
    ChooseIcon: '' as IntlString,
    NoParentDocument: '' as IntlString,
    NoBacklinks: '' as IntlString,
    NoHistory: '' as IntlString,
    Untitled: '' as IntlString,

    Description: '' as IntlString,
    DescriptionPlaceholder: '' as IntlString,

    Star: '' as IntlString,
    Unstar: '' as IntlString,
    CopyDocumentUrl: '' as IntlString,

    ViewMode: '' as IntlString,
    EditMode: '' as IntlString,
    SuggestMode: '' as IntlString,

    ChildDocuments: '' as IntlString,
    Embedding: '' as IntlString,
    Embeddings: '' as IntlString,

    CompareTo: '' as IntlString,

    UnassignToDo: '' as IntlString,
    UnassignToDoConfirm: '' as IntlString,
    ReassignToDo: '' as IntlString,
    ReassignToDoConfirm: '' as IntlString,

    Docs: '' as IntlString,
    Color: '' as IntlString,
    Icon: '' as IntlString
  }
})
