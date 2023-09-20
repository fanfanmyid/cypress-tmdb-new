/// <reference types="cypress" />
import {routes, users} from "@support/helpers";
import loginPage from '../../pages/loginPage'

describe('Authentication', () => {
    beforeEach(() => {
        cy.visit(routes.baseUrl)
    })
    it('Auth-Login#1 - Successfully Login ', () => {
        loginPage.doLogin(users.primary.username,users.primary.password)
        cy.get('.about > :nth-child(1) > h2 > a').should('have.text', 'fanfanmyid')
    })

    it('Auth-Login#2 - Failed Login using wrong password ', () => {
        loginPage.doLogin(users.secondary.username,users.secondary.password)
        cy.get('.background_color > :nth-child(1)').should('contain.text', 'There was a problem')
    });

    it('Auth-Login#3 - Failed Login using wrong username ', () => {
        loginPage.doLogin(users.tertiary.username,users.tertiary.password)
        cy.get('.background_color > :nth-child(1)').should('contain.text', 'There was a problem')
    });
    it('Auth-Login#4 - Failed Login using wrong username and password ', () => {
        loginPage.doLogin(users.quaternary.username,users.quaternary.password)
        cy.get('.background_color > :nth-child(1)').should('contain.text', 'There was a problem')
    });

    it('Auth-Login#5 - Failed Login without fill username ', () => {
        loginPage.doLogin('',users.primary.password)
        cy.get('.background_color > :nth-child(1)').should('contain.text', 'There was a problem')
    });

    it('Auth-Login#6 - Failed Login without fill password ', () => {
        loginPage.doLogin(users.primary.username,'')
        cy.get('.background_color > :nth-child(1)').should('contain.text', 'There was a problem')
    });
})