export interface CreateUser {
    user: {
        email: string;
        first_name: string;
        last_name: string;
        country: string;
        city: string;
        birth_date: string;
    };
    password: string;
}