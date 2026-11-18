// Teste E2E: simula o usuario no navegador, do login ate o painel.
// Local: cypress/e2e/login.cy.ts (pasta cypress na RAIZ do repositorio)
// Credenciais: npx cypress open --browser electron --env EMAIL=maria@savana.com,SENHA=123456

const campoEmail = 'input[placeholder="Digite seu email"]';
const campoSenha = 'input[placeholder="Digite sua senha"]';

describe('Login de funcionário', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('exibe o formulário de login', () => {
    cy.get(campoEmail).should('be.visible');
    cy.get(campoSenha).should('be.visible');
    cy.contains('button', 'Entrar').should('be.visible');
    cy.contains('button', 'Cadastrar-se').should('be.visible');
  });

  it('não chama a API quando o email tem formato inválido', () => {
    cy.intercept('POST', '**/auth/login').as('login');
    cy.get(campoEmail).type('nao-e-email');
    cy.get(campoSenha).type('123456');
    cy.contains('button', 'Entrar').click();

    cy.get('@login.all').should('have.length', 0);
    cy.location('pathname').should('eq', '/login');
  });

  it('mantém o usuário no /login quando o backend recusa as credenciais', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('loginRecusado');

    cy.get(campoEmail).type('func@savana.com');
    cy.get(campoSenha).type('senhaerrada');
    cy.contains('button', 'Entrar').click();

    cy.wait('@loginRecusado');
    cy.location('pathname').should('eq', '/login');
  });

  it('faz login com credenciais válidas e sai da tela de login', () => {
    cy.intercept('POST', '**/auth/login').as('login');

    // Cypress 16: Cypress.env() foi removido, usa-se cy.env() para valores sensíveis
    cy.env(['EMAIL', 'SENHA']).then(({ EMAIL, SENHA }) => {
      cy.get(campoEmail).type(EMAIL);
      cy.get(campoSenha).type(SENHA, { log: false });
    });
    cy.contains('button', 'Entrar').click();

    cy.wait('@login').its('response.statusCode').should('be.oneOf', [200, 201]);
    cy.location('pathname').should('not.eq', '/login');
  });
});
