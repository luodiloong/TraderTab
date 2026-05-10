<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { toRef, computed } from 'vue'

import Pin12Regular from '~icons/fluent/pin-12-regular'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const settings = useSettingsStore()

// 1. 在这里新增了 type 和 children，用于支持文件夹
const props = defineProps<{
  url?: string
  title: string
  pined?: boolean
  favicon?: string
  type?: 'link' | 'folder'
  children?: any[]
  onContextMenu?: (event: MouseEvent | PointerEvent) => void
}>()

const faviconRef = getFaviconURL(toRef(props, 'url' as any))
const iconUrl = computed(() => props.favicon || faviconRef.value)

const perf = usePerfClasses(() => ({
  transparent: settings.perf.shortcut.transparent,
  blur: settings.perf.shortcut.blur,
}))

const iconClass = perf('shortcut__icon')
const pinIconClass = perf('shortcut__pin-icon')
</script>

<template>
  <div role="button" class="shortcut__item noselect" :class="[{ pined: pined }]">
    <OnLongPress
      as="a"
      ref="itemRef"
      class="shortcut__item-link"
      tabindex="-1"
      :href="type === 'folder' ? 'javascript:void(0)' : url"
      :target="settings.shortcut.openInNewTab && type !== 'folder' ? '_blank' : '_self'"
      @contextmenu.stop.prevent="onContextMenu"
      @trigger="
        (e: PointerEvent) => {
          if (isHasTouchDevice && isTouchEvent(e)) onContextMenu?.(e)
        }
      "
    >
      <div
        class="shortcut__icon-container"
        :style="{ marginBottom: `${settings.shortcut.spacing.iconTitleGap}px` }"
      >
        <div
          v-if="pined && settings.shortcut.pinnedIcon && settings.shortcut.topSites"
          class="shortcut__pin-icon"
          :class="pinIconClass"
        >
          <el-icon size="11">
            <pin12-regular />
          </el-icon>
        </div>

        <div v-if="type === 'folder'" class="folder-box">
          <div class="mini-grid">
            <template v-if="children && children.length > 0">
              <img 
                v-for="(child, index) in children.slice(0, 4)" 
                :key="index" 
                :src="child.favicon || getFaviconURL(toRef(child, 'url')).value" 
                class="mini-icon"
              />
            </template>
          </div>
        </div>

        <div
          v-else
          class="shortcut__icon"
          :class="[iconClass, { border: settings.shortcut.style.border }]"
        >
          <span
            class="span"
            :style="{
              backgroundImage: `url(${iconUrl})`,
            }"
          ></span>
        </div>

      </div>
      <el-text
        :data-content="title"
        v-if="settings.shortcut.title.show"
        class="shortcut__title"
        :style="{ width: `calc(var(--icon_size) + ${settings.shortcut.title.extraWidth}px)` }"
        truncated
      >
        {{ title }}
      </el-text>
    </OnLongPress>
  </div>
</template>

<style lang="scss" scoped>
.folder-box {
  width: var(--icon_size);
  height: var(--icon_size);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: var(--icon_radius);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  .mini-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 4px;
    width: 100%;
    height: 100%;

    .mini-icon {
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: cover;
      background-color: rgba(255,255,255,0.5); /* 占位色 */
    }
  }
}
</style>
