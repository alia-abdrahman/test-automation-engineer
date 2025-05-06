describe("Product and Order Management E2E Tests", () => {
  beforeEach(() => {
    // Visit the main page before each test
    cy.visit("http://localhost:4200");
  });

  // --- Product Listing Tests ---
  it("should load the product listing page and display product names", () => {
    // Corresponds to: TC_NAV_001, TC_PROD_001
    cy.get(".product-card h3").should("be.visible").and("not.be.empty");
  });

  it("should display product prices in the correct format", () => {
    // Corresponds to: TC_PROD_002
    cy.get(".product-card p").contains("MYR").should("be.visible");
  });

  it("should display product descriptions", () => {
    // Corresponds to: TC_PROD_003
    cy.get(".product-card p").should("be.visible").and("not.be.empty");
  });

  // --- Create Product Tests ---
  it("should navigate to the create product page and create a new product", () => {
    // Corresponds to: TC_CREATE_001, TC_CREATE_PROD_003
    cy.get("a").contains("Create").click(); // Click the "Create" button
    cy.url().should("include", "/create"); // Verify navigation

    const productName = "Test Product";
    const productDescription = "Test Description";
    const productPrice = "10.00";

    cy.get('[name="name"]').type(productName);
    cy.get('[name="description"]').type(productDescription);
    cy.get('[name="price"]').type(productPrice);
    cy.get("button").contains("Create").click(); // Click the "Create" button on the form

    // Verify the new product is displayed on the product listing page
    cy.visit("http://localhost:4200"); // Go back to product list
    cy.contains(".product-card h3", productName).should("be.visible");
    cy.contains(".product-card p", productDescription).should("be.visible");
    cy.contains(".product-card p", `MYR${productPrice}`).should("be.visible");
  });

  it("should display an error when creating a product with an empty name", () => {
    // Corresponds to: TC_CREATE_PROD_004
    cy.get("a").contains("Create").click();
    cy.get('[name="description"]').type("Description");
    cy.get('[name="price"]').type("12");
    cy.get("button").contains("Create").click();
    cy.contains("Product Name is required").should("be.visible");
  });

  // --- Edit Product Tests ---
  it("should navigate to the edit product page and update a product", () => {
    // Corresponds to: TC_PROD_ACT_001, TC_EDIT_PROD_004, TC_EDIT_PROD_005, TC_EDIT_PROD_006
    // Find the "Edit" button for the first product
    cy.get(".product-card").first().find("button").contains("Edit").click();

    cy.url().should("include", "/edit"); // Verify navigation

    const updatedName = "Updated Product Name";
    const updatedDescription = "Updated Description";
    const updatedPrice = "15.50";

    cy.get('[name="name"]').clear().type(updatedName);
    cy.get('[name="description"]').clear().type(updatedDescription);
    cy.get('[name="price"]').clear().type(updatedPrice);
    cy.get("button").contains("Update").click();

    // Verify the updated product details on the product listing page
    cy.visit("http://localhost:4200");
    cy.contains(".product-card h3", updatedName).should("be.visible");
  });

  it("should display an error when updating the product price with non-numeric input", () => {
    // Corresponds to TC_EDIT_PROD_007
    cy.get(".product-card").first().find("button").contains("Edit").click();
    cy.get('[name="price"]').clear().type("abc");
    cy.get("button").contains("Update").click();
    cy.contains("Product Price is invalid").should("be.visible");
  });

  // --- Order Creation Tests ---
  it("should navigate to the order creation page and create an order", () => {
    // Corresponds to: TC_PROD_ACT_003, TC_ORDER_CREATE_001, TC_ORDER_CREATE_002, TC_ORDER_CREATE_003, TC_ORDER_CREATE_004, TC_ORDER_CREATE_008
    // Find the "Order" button for the first product and click it
    cy.get(".product-card").first().find("button").contains("Order").click();

    cy.url().should("include", "/order"); // Verify navigation

    // Verify product details are pre-filled
    cy.get('[name="productName"]').should("not.be.empty");
    cy.get('[name="productDescription"]').should("not.be.empty");
    cy.get('[name="productPrice"]').should("not.be.empty");

    const quantity = "2";
    cy.get('[name="quantity"]').type(quantity);
    cy.get("button").contains("Create Order").click();

    // Verify that the order is displayed on the orders page
    cy.get("a").contains("Orders").click();
    cy.get("table").contains(quantity).should("be.visible");
  });

  it("should display an error when creating an order with quantity zero", () => {
    // Corresponds to TC_ORDER_CREATE_005
    cy.get(".product-card").first().find("button").contains("Order").click();
    cy.get('[name="quantity"]').type("0");
    cy.get("button").contains("Create Order").click();
    cy.contains("Quantity must be greater than zero").should("be.visible");
  });

  // --- Order Listing and Deletion ---
  it("should display orders and delete an order", () => {
    // Corresponds to TC_ORDERS_LIST_001, TC_ORDERS_LIST_002, TC_ORDERS_DELETE_001, TC_ORDERS_DELETE_002
    cy.get("a").contains("Orders").click();
    cy.url().should("include", "/orders");

    // Verify the table headers
    cy.get("table").should("contain", "Order ID");
    cy.get("table").should("contain", "Order Date");
    cy.get("table").should("contain", "Product Name");
    cy.get("table").should("contain", "Price");
    cy.get("table").should("contain", "Quantity");
    cy.get("table").should("contain", "Total");
    cy.get("table").should("contain", "Actions");

    // Delete the first order
    cy.get("table tbody tr:first-child button").contains("Delete").click();
    cy.on("window:confirm", () => true); // Confirm the deletion
    cy.get("table tbody tr:first-child button").should("not.exist");
  });
});
