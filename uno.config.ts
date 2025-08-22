import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),  
    presetAttributify(),
    presetIcons(),
  ],
  theme: {
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-md transition-colors',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/80',
    'card': 'bg-white rounded-lg shadow-md p-6',
  },
});