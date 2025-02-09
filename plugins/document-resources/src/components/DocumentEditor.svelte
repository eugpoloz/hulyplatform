<!--
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
-->
<script lang="ts">
  import { Extensions, FocusPosition } from '@tiptap/core'
  import document, { Document } from '@hcengineering/document'
  import {
    CollaboratorEditor,
    HeadingsExtension,
    ImageOptions,
    SvelteNodeViewRenderer,
    TodoItemExtension,
    TodoListExtension,
    collaborativeDocumentId,
    platformDocumentId
  } from '@hcengineering/text-editor'
  import { createEventDispatcher } from 'svelte'

  import ToDoNodeView from './node-view/ToDoNodeView.svelte'

  export let object: Document
  export let readonly = false
  export let boundary: HTMLElement | undefined = undefined
  export let attachFile: ImageOptions['attachFile'] | undefined = undefined
  export let focusIndex = -1
  export let overflow: 'auto' | 'none' = 'none'
  export let editorAttributes: Record<string, string> = {}

  let collabEditor: CollaboratorEditor

  export function focus (position?: FocusPosition): void {
    collabEditor.focus(position)
  }

  const dispatch = createEventDispatcher()

  const handleExtensions = (): Extensions => [
    HeadingsExtension.configure({
      onChange: (headings) => {
        dispatch('headings', headings)
      }
    }),
    TodoItemExtension.extend({
      addNodeView () {
        return SvelteNodeViewRenderer(ToDoNodeView, { contentAs: 'li', componentProps: { object } })
      }
    }).configure({
      HTMLAttributes: {
        class: 'todo-item'
      }
    }),
    TodoListExtension.configure({
      HTMLAttributes: {
        class: 'todo-list'
      }
    })
  ]

  $: documentId = collaborativeDocumentId(object.content)
  $: targetContentId = platformDocumentId(document.class.Document, object._id, 'content')
</script>

<CollaboratorEditor
  {documentId}
  {targetContentId}
  {focusIndex}
  {readonly}
  {attachFile}
  {boundary}
  {overflow}
  {editorAttributes}
  onExtensions={handleExtensions}
  on:update
  on:open-document
  bind:this={collabEditor}
/>
