export default {
  name: 'json-tree',
  props: {
    data: { default: undefined },
    raw: { type: String, default: undefined },
    level: { type: Number, default: Infinity },
    kv: { type: Object, default: undefined }
  },
  computed: {
    display() {
      let val = this.data
      if (this.raw !== undefined) {
        try { val = JSON.parse(this.raw) } catch { val = this.raw }
      }
      try { return JSON.stringify(val, null, 2) } catch { return String(val) }
    }
  },
  template: `<pre class="json-tree" style="font-family:monospace;font-size:12px;line-height:1.6;padding:10px;background:#f7f8f9;border-radius:3px;overflow:auto;margin:2px 0;min-width:320px;color:#394359">{{ display }}</pre>`
}
