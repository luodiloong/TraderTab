<script setup lang="ts">
import { OnLongPress } from '@vueuse/components'
import { toRef } from 'vue'

import Pin12Regular from '~icons/fluent/pin-12-regular'

import { getFaviconURL } from '@/shared/media'
import { useSettingsStore } from '@/shared/settings'

import usePerfClasses from '@newtab/composables/usePerfClasses'
import { isHasTouchDevice, isTouchEvent } from '@newtab/shared/touch'

const settings = useSettingsStore()

const props = defineProps<{
  url: string
  title: string
  pined?: boolean
  favicon?: string
  onContextMenu?: (event: MouseEvent | PointerEvent) => void
}>()

// 使用 Ref 传递 url，让 getFaviconURL 内部监听变化
const faviconRef = getFaviconURL(toRef(props, 'url'))
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
      :href="url"
      :target="settings.shortcut.openInNewTab ? '_blank' : '_self'"
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
        <div
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

<template>
  <div class="shortcut-item-wrapper">
    <div v-if="item.type !== 'folder'" class="icon-box">
      <img :src="item.favicon" class="icon" />
    </div>

    <div v-else class="folder-box">
      <div class="mini-grid">
        <img 
          v-for="child in item.children.slice(0, 4)" 
          :key="child.id" 
          :src="child.favicon" 
          class="mini-icon"
        />
      </div>
    </div>
    <div class="title">{{ item.title }}</div>
  </div>
</template>


<style lang="scss" scoped>
/* 顶部标签栏的容器样式 */
.category-tabs-container {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1); /* 毛玻璃感背景 */
  backdrop-filter: blur(10px);
  border-radius: 15px;
  width: fit-content;
  margin-inline: auto;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    cursor: pointer;
    border-radius: 10px;
    transition: background 0.3s;
    color: #fff;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    &.active {
      background: rgba(255, 255, 255, 0.25);
      font-weight: bold;
    }
  }
}
}
</style>
<style lang="scss" scoped>

/* (这里是文件原本可能有的其他样式，不用管它) */

/* 下面是你加的文件夹样式 */
.folder-box {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;

  .mini-icon {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    object-fit: cover;
  }  /* 这是结束 mini-icon 的括号 */
}    /* 🚨 重点：这是结束 folder-box 的括号，你很可能是漏复制了这个！ */
</style>
