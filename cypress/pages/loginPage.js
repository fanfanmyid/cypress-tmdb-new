class LoginPage {
    elements = {
        username:()=>cy.get('#username'),
        password:() => cy.get('#password'),
        btnLoginSubmit:() =>cy.get('#login_button'),
        btnLoginPage:()=>cy.get('.primary > :nth-child(3) > a'),
        alertFailMessage:() =>cy.get('.background_color > :nth-child(1)'),
        h1profileName:()=>cy.get('.about > :nth-child(1) > h2 > a')
    }

    doLogin(username,password){
        this.elements.btnLoginPage().click()
        if(username) this.elements.username().type(username)
        if(password) this.elements.password().type(password)
        this.elements.btnLoginSubmit().click()
    }
}

module.exports = new LoginPage()