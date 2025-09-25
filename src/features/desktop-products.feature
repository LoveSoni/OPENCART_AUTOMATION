Feature: Desktop Products Verification

  Background:
    Given user is on the OpenCart homepage

  @desktop @sanity
  Scenario: Sanity test - Verify desktop products are visible
    When user navigates to the desktop section
    And user clicks on "Show All Desktops" button
    Then verify user should see the desktop section details page
    And verify desktop products count should be greater than 0

  @desktop @price-validation
  Scenario Outline: Verify desktop name and price in different currencies
    When user navigates to the desktop section
    And user clicks on "Show All Desktops" button
    Then verify user should see the desktop section details page
    And validate desktop names should match test data
    When user changes currency to "<currency>"
    Then validate desktop prices should match <currency> prices from test data

    Examples:
      | currency |
      | USD      |
      | EUR      |
      | GBP      |
