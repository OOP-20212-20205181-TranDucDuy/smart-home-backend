import { CacheModuleAsyncOptions } from "@nestjs/cache-manager"

export const cachingModuleConfig = () => {
    const config : CacheModuleAsyncOptions = {
        useFactory : () => ({
            ttl : parseInt(process.env.CACHE_TTL) || 500,
        }),
        isGlobal : true,
    }
    return config
}