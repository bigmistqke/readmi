import dts from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/test.ts'],
  outdir: './dist',
  plugins: [dts()],
})
