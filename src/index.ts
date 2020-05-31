import {App} from './app';

async function main(): Promise<void> {
    const app = new App();
    await app.listen();
}

main();
