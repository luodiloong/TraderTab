import { defineStore } from 'pinia'

import { acquireFaviconRef } from '@/shared/media'

import { defaultShortcuts, type Shortcuts, shortcutStorage } from './shortcutStorage'

export const useShortcutStore = defineStore('shortcut', () => {
  const items = ref(structuredClone(defaultShortcuts.items))

  const init = async (options?: { acquire?: boolean }) => {
    const shortcut = await shortcutStorage.getValue()
    items.value = shortcut.items
    if (options?.acquire ?? true) {
      shortcut.items.forEach((item) => acquireFaviconRef(item.url))
    }
  }

  const save = async (data?: Shortcuts) => {
    if (data) {
      items.value = data.items
    }
    await shortcutStorage.setValue({ items: toRaw(items.value) })
  }

  return { items, init, save }
})

import { ref } from 'vue';

// 在 setup store 内部添加：
export const categories = ref([
  { id: 'home', name: '主页', icon: 'i-carbon-home' },
  { id: 'macro', name: '宏观', icon: 'i-carbon-chart-line' },
  { id: 'trade', name: '交易', icon: 'i-carbon-finance' },
]);
export const activeCategoryId = ref('home');

// 修改获取 shortcut 列表的 computed，使其支持过滤：
export const filteredShortcuts = computed(() => {
  if (activeCategoryId.value === 'home') return shortcuts.value;
  return shortcuts.value.filter(s => s.categoryId === activeCategoryId.value);
});
