export default {
  name: 'see',
  directive: {
    mounted (el, { value, arg = 10, modifiers = {} }) {
      let point = Number(arg) > 100 ? 100 : Number(arg)
      point = (point / 100).toFixed(1)
      point = Number(point)
      let io = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio > point) {
          if (modifiers.once) {
            io.disconnect()
          }
          value()
        }
      }, {
        threshold: [0, point]
      })
      io.observe(el)
    }
  }
}