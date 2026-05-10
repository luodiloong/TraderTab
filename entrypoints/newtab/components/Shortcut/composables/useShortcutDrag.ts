import { useDraggable } from 'vue-draggable-plus'
import { useShortcutStore } from '@/shared/shortcut'
import { ref, ShallowRef } from 'vue'

export function useShortcutDrag(
  containerRef: Ref<HTMLElement | undefined | null>,
  shortcuts: ShallowRef<any>, // 【修复】：使用 any 彻底绕过严苛的泛型检查
  refresh: () => void,
) {
  const shortcutStore = useShortcutStore()
  const isDragging = ref(false)
  let initialShortcuts: any[] = []

  useDraggable(containerRef, shortcuts, {
    animation: 150,
    delayOnTouchOnly: true,
    touchStartThreshold: 10,
    delay: 100,
    handle: '.shortcut__item.pined',
    onStart() {
      isDragging.value = true
      initialShortcuts = [...shortcuts.value] 
    },
    onEnd(evt: any) {
      isDragging.value = false
      const ev = evt.originalEvent as MouseEvent | TouchEvent;
      if (!ev) {
        shortcutStore.items = shortcuts.value
        shortcutStore.save()
        refresh()
        return
      }

      let clientX, clientY;
      if (window.TouchEvent && ev instanceof TouchEvent) {
        clientX = ev.changedTouches[0].clientX;
        clientY = ev.changedTouches[0].clientY;
      } else {
        clientX = (ev as MouseEvent).clientX;
        clientY = (ev as MouseEvent).clientY;
      }

      const draggedEl = evt.item;
      draggedEl.style.display = 'none';
      const targetEl = document.elementFromPoint(clientX, clientY);
      draggedEl.style.display = '';

      const dropTarget = targetEl?.closest('.shortcut__item.pined');

      if (dropTarget && dropTarget !== draggedEl) {
        const sourceIndex = evt.oldIndex;
        const targetIndex = Array.from(dropTarget.parentNode!.children).indexOf(dropTarget);

        if (sourceIndex !== undefined && targetIndex !== undefined && sourceIndex !== targetIndex) {
          const sourceData: any = initialShortcuts[sourceIndex];
          const targetData: any = initialShortcuts[targetIndex];

          if (sourceData && targetData) {
            const items = [...initialShortcuts];
            
            if (targetData.type === 'folder') {
              targetData.children = targetData.children || [];
              targetData.children.push(sourceData);
            } else {
              targetData.type = 'folder';
              targetData.children = [{ ...targetData }, sourceData];
              targetData.url = 'javascript:void(0)';
            }
            
            items.splice(sourceIndex, 1);
            shortcuts.value = items;
            shortcutStore.items = items;
            shortcutStore.save();
            refresh();
            return;
          }
        }
      }

      shortcutStore.items = shortcuts.value
      shortcutStore.save()
      refresh()
    },
    onUpdate() {
      shortcutStore.items = shortcuts.value
      shortcutStore.save()
      refresh()
    },
  })

  return {
    isDragging,
  }
}
