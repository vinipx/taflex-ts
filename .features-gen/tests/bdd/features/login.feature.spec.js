// Generated from: tests/bdd/features/login.feature
import { test } from "../../../../tests/fixtures.ts";

test.describe('User Login', () => {

  test('Successful login to The Internet', { tag: ['@PROJ-123'] }, async ({ Given, When, Then, And, driver }) => { 
    await Given('I navigate to "https://the-internet.herokuapp.com/login"', null, { driver }); 
    await When('I enter "tomsmith" as username and "SuperSecretPassword!" as password', null, { driver }); 
    await And('I click on the login button', null, { driver }); 
    await Then('I should see "You logged into a secure area!" in the flash message', null, { driver }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/bdd/features/login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@PROJ-123"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given I navigate to \"https://the-internet.herokuapp.com/login\"","stepMatchArguments":[{"group":{"start":14,"value":"\"https://the-internet.herokuapp.com/login\"","children":[{"start":15,"value":"https://the-internet.herokuapp.com/login","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When I enter \"tomsmith\" as username and \"SuperSecretPassword!\" as password","stepMatchArguments":[{"group":{"start":8,"value":"\"tomsmith\"","children":[{"start":9,"value":"tomsmith","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"},{"group":{"start":35,"value":"\"SuperSecretPassword!\"","children":[{"start":36,"value":"SuperSecretPassword!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Action","textWithKeyword":"And I click on the login button","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"Then I should see \"You logged into a secure area!\" in the flash message","stepMatchArguments":[{"group":{"start":13,"value":"\"You logged into a secure area!\"","children":[{"start":14,"value":"You logged into a secure area!","children":[{"children":[]}]},{"children":[{"children":[]}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end