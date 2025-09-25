Feature: Phones & PDAs Products Verification

  Background:
    Given user is on the OpenCart homepage

  @phone @sanity
  Scenario: Sanity test - Verify phone products are visible
    When user navigates to the phones section
    And user clicks on "Show All Phones & PDAs" button
    Then verify user should see the phones section details page
    And verify phone products count should be greater than 0

  @phone @price-validation
  Scenario Outline: Verify phone name and price in different currencies
    When user navigates to the phones section
    And user clicks on "Show All Phones & PDAs" button
    Then verify user should see the phones section details page
    And validate phone names should match test data
    When user changes currency to "<currency>"
    Then validate phone prices should match <currency> prices from test data

    Examples:
      | currency |
      | USD      |
      | EUR      |
      | GBP      |
