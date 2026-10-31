/** Boundaries of docs/architecture.md: the domain is plain TypeScript, only adapters reach outside systems. */
export default {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'The domain imports nothing but the domain: no adapter, page, framework, package or Node module.',
      severity: 'error',
      from: { path: '^src/domain/', pathNot: '\\.test\\.ts$' },
      to: { pathNot: '^src/domain/' },
    },
    {
      name: 'adapters-below-pages',
      comment: 'Adapters serve pages and the pipeline, never the other way round.',
      severity: 'error',
      from: { path: '^src/adapters/' },
      to: { path: '^src/(pages|layouts|components|pipeline)/' },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    {
      name: 'not-to-unresolvable',
      comment: "Astro's virtual modules (astro:env…) resolve at build time only.",
      severity: 'error',
      from: {},
      to: { couldNotResolve: true, pathNot: '^astro:' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'default', 'node'] },
  },
};
