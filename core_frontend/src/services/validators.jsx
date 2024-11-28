

export class SignUpValidator {
    constructor(username, password, password2) {
        this.username = username
        this.password = password
        this.password2 = password2
        this.errors = []
    }

    is_valid() {
        if (this.username === '' || this.password === '' || this.password2 === '') {
            this.errors.push({message: 'All fields are required'})
        }
        if (this.password !== this.password2) {
            this.errors.push({password2: 'Passwords do not match'})
        }
        if (this.username.length < 2){
            this.errors.push({username: 'Username must be at least 2 characters'})
        }
        if (this.password.length < 8 || this.password2.length < 8){
            this.errors.push({password: 'Password must be at least 8 characters'})
        }
        return this.errors.length === 0;
    }

    show_errors(){
        return this.errors
    }
}