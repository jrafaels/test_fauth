import {TokenExpired} from '../model/TokenExpired';

export interface TokenRepository {
    create(token: TokenExpired): Promise<TokenExpired>;

    findOne(token: string): Promise<TokenExpired>;
}

export class TokenRepositoryImpl implements TokenRepository {

    /**
     * Save a new token expired on database. This is an inbalid token.
     * @param token
     */
    create(token: TokenExpired): Promise<TokenExpired> {
        return token.save()
            .then(result => {
                return result;
            }).catch(error => {
                throw error;
            });
    }

    /**
     * Return a JWT token stored on database. This is an invalid token.
     * @param token
     */
    findOne(token: string): Promise<TokenExpired> {
        return TokenExpired.findOne({where: {text: token}})
            .then(result => {
                return result;
            }).catch(error => {
                throw error;
            });
    }
}