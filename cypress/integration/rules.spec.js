import { shouldBeRedirectedToLogin } from '../support/assertions';

describe('Rules page', () => {
  it('when not logged in it should redirect to login page', () => {
    cy.visit('#/rules');
    shouldBeRedirectedToLogin();
  });

  describe('when logged in', () => {
    const testRuleName = 'MOD09GQ_TEST_kinesisRule';
    const testProviderId = 'PODAAC_SWOT';
    const testCollectionId = 'MOD09GQ / 006';

    beforeEach(() => {
      cy.login();
    });

    it('should display a link to view rules', () => {
      cy.visit('/');
      cy.get('nav').contains('Rules').should('exist');
    });

    it('should display a list of rules', () => {
      cy.visit('/');
      cy.get('nav').contains('Rules').click();
      cy.url().should('include', '/#/rules');
      cy.get('table tbody tr').should('have.length', 1);
      cy.get(`table tr[data-value="${testRuleName}"]`)
        .should('exist')
        .within(() => {
          cy.contains(testProviderId).should('exist');
          cy.contains(testCollectionId).should('exist');
          // Has to be the last assertion so that this element
          // is yielded to the click() command.
          cy.contains(testRuleName).should('exist');
        })
        .click();
      cy.url().should('include', `/#/rules/rule/${testRuleName}`);
    });

    it('display a rule with the correct data', () => {
      cy.visit(`/#/rules/rule/${testRuleName}`);
      cy.get('.metadata__details')
        .should('exist')
        .within(() => {
          cy.get('dt')
            .contains('RuleName')
            .next('dd')
            .should('contain', testRuleName);
          cy.get('dt')
            .contains('Workflow')
            .next('dd')
            .should('contain', 'KinesisTriggerTest');
          cy.get('dt')
            .contains('Provider')
            .next('dd')
            .contains('PODAAC_SWOT')
            .should('exist');
        });
    });
  });
});
