import cors from 'cors'
import allowedOrigins from '../env/origins'

export default ( origins: string[] ) => {
    
    let all_origins: (string|undefined)[] = [...allowedOrigins, ...origins]

    const corsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (all_origins.indexOf(origin) !== -1 || !origin) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }

    return cors(corsOptions)

}