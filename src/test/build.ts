import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./test.ts'],
  outdir: './dist',
  plugins: [dts()],
})
