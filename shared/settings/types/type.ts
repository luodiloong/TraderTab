export interface localBackground {
  id: string
  /** @deprecated */
  url?: string
  mediaType?: 'image' | 'video' // 可选的媒体类型: 'image' | 'video'，用于在渲染时选择 <img> 或 <video>
  // ▼▼▼ 新增以下内容 ▼▼▼
  type?: 'link' | 'folder';       // 标识是普通链接还是文件夹
  children?: IShortcut[];         // 如果是文件夹，这里存放它包含的链接
  categoryId?: string;            // 标识所属的 Tab 分类
  // ▲▲▲ 新增以上内容 ▲▲▲
}

export interface bingBackground {
  id: string
  /** @deprecated */
  url?: string
  updateDate: string | number
}
