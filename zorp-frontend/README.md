# Template for dApp built in Next.js

Template for a decentralized application (dApp) built in [Next](https://nextjs.org).

- [TypeScript](https://www.typescriptlang.org)
- [Next 15](https://nextjs.org/blog/next-15)
- [TanStack Query](https://tanstack.com/query/latest)
- [Sass](https://sass-lang.com)
- [Tailwind CSS](https://tailwindcss.com)

### Web3 Packages

- [viem](https://viem.sh/)
- [rainbowkit](https://www.rainbowkit.com)
- [wagmi](https://wagmi.sh)

---

## Available Scripts

### Development Mode

#### Start the Development Server

These commands start the application in development mode. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result. The page auto-updates as you edit the file.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

> Note; if `Error: The WebCrypto API is not available` errors pop, then it is
> likely because your browser is not connecting via a secure context!  I.E.
> over `https://<domain>` or `localhost`
>
> For local development within a container, such as those provided by Docker,
> you will need to setup port forwarding and/or firewall rules.

### Production Build

#### Build the App for Production

These commands build an optimized version of the application for production, saved in the `.next` folder.

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### Production Server

#### Start the Production Server

After building the application, use these commands to start the server in production mode.

```bash
npm run start
# or
yarn start
# or
pnpm start
```

### Code Quality

#### Run the Linter

Run these commands to start the linter, which helps maintain code quality and find any issues.

```bash
npm run lint
# or
yarn lint
# or
pnpm lint
```

### Testing

#### Run all tests once

```bash
npm test
```

#### Run all tests when changes are detected

```bash
npm test:watch
```

#### Run specific test

```bash
# npm test -- <File_Or_Test_Name>
npm test -- InputFileToEncryptedMessage
```

---

## Deployment tips

### Add chain

The `./src/lib/constants/wagmiConfig.ts` file defines various data structures
for configuring available chains.  In some cases, such as for `sepolia`, it may
be possible to extend pre-existing defaults; and in other cases, such as
`anvil`, more care must be taken to ensure all customizations are correctly
configured.

