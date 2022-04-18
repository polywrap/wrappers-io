import { buildMainDependencyContainer } from "./buildMainDependencyContainer";

async function init() {
    const container = await buildMainDependencyContainer();
    const deps = container.cradle;

    deps.ensTrackingApi.run();
}

init();