Feature: Laptop & Notebook Products Verification

  Background:
    Given user is on the OpenCart homepage

  @laptop @sanity
  Scenario: Sanity test - Verify laptop products are visible
    When user navigates to the laptop section
    And user clicks on "Show All Laptops & Notebooks" button
    Then verify user should see the laptop section details page
    And verify laptop products count should be greater than 0

  @laptop @price-validation
  Scenario Outline: Verify laptop name and price in different currencies
    When user navigates to the laptop section
    And user clicks on "Show All Laptops & Notebooks" button
    Then verify user should see the laptop section details page
    And validate laptop names should match test data
    When user changes currency to "<currency>"
    Then validate laptop prices should match <currency> prices from test data

    Examples:
      | currency |
      | USD      |
      | EUR      |
      | GBP      |
