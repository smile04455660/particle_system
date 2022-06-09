import { SnowflakeSystem } from "./snowflake"
import {WaveSystem} from "./wave"
import {SlitSystem} from "./slit"

function main() {
    const slit = new SlitSystem();
    slit.run();
}

main();
