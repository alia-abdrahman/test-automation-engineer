const chai = require('chai');
const expect = chai.expect;

const API_BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  let testsFailed = false;

  global.describe = (suiteName, fn) => {
    console.log(`\nRunning test suite: ${suiteName}`);
    fn();
  };

  global.it = async (testName, fn) => {
    console.log(`  - Running test: ${testName}`);
    try {
      await fn();
      console.log(`    ${testName}: \x1b[32mPASSED\x1b[0m`); // Green for pass
    } catch (error) {
      console.error(`    ${testName}: \x1b[31mFAILED\x1b[0m`, error); // Red for fail
      console.error('    ', error);
      testsFailed = true;
    }
  };

  describe('Fruit Stall API Integration Tests', () => {
    describe('/products endpoint', () => {
      it('should GET all products', async () => {
        const response = await fetch(`${API_BASE_URL}/products`);
        expect(response.status).to.equal(200);
        const data = await response.json();
        expect(data).to.be.an('array');
        // Add more assertions to check the structure and content of the product data if needed
      });

      it('should POST a new product and GET it', async () => {
        const newProduct = {
          name: 'Integration Test Fruit',
          description: 'This is a test product added via integration test.',
          price: 9.99,
        };

        const postResponse = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
        });

        expect(postResponse.status).to.equal(201); // Assuming 201 Created on successful POST
        const createdProduct = await postResponse.json();
        expect(createdProduct).to.have.property('id');
        expect(createdProduct.name).to.equal(newProduct.name);
        expect(createdProduct.description).to.equal(newProduct.description);
        expect(createdProduct.price).to.equal(newProduct.price);

        // GET the created product
        const getResponse = await fetch(
          `${API_BASE_URL}/products/${createdProduct.id}`,
        );
        expect(getResponse.status).to.equal(200);
        const fetchedProduct = await getResponse.json();
        expect(fetchedProduct).to.deep.equal(createdProduct);
      });

      it('should DELETE a product', async () => {
        // First, create a product to delete
        const newProduct = { name: 'ToDelete', price: 1.0 };
        const postResponse = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct),
        });
        const createdProduct = await postResponse.json();

        // Then, DELETE the product
        const deleteResponse = await fetch(
          `${API_BASE_URL}/products/${createdProduct.id}`,
          {
            method: 'DELETE',
          },
        );
        expect(deleteResponse.status).to.equal(204); // Assuming 204 No Content on successful DELETE

        // Try to GET the deleted product - should return 404 Not Found
        const getResponse = await fetch(
          `${API_BASE_URL}/products/${createdProduct.id}`,
        );
        expect(getResponse.status).to.equal(404);
      });
    });

    describe('/orders endpoint', () => {
      it('should POST a new order and GET it', async () => {
        // Assuming you have at least one product in your database to create an order for
        const sampleProductId = 1; // Replace with an actual product ID if needed
        const newOrder = {
          productId: sampleProductId,
          quantity: 2,
        };

        const postResponse = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newOrder),
        });

        expect(postResponse.status).to.equal(201);
        const createdOrder = await postResponse.json();
        expect(createdOrder).to.have.property('id');
        expect(createdOrder.productId).to.equal(newOrder.productId);
        expect(createdOrder.quantity).to.equal(newOrder.quantity);
        expect(createdOrder).to.have.property('orderDate');
        expect(createdOrder).to.have.property('total');

        // GET the created order
        const getResponse = await fetch(
          `${API_BASE_URL}/orders/${createdOrder.id}`,
        );
        expect(getResponse.status).to.equal(200);
        const fetchedOrder = await getResponse.json();
        expect(fetchedOrder).to.deep.equal(createdOrder);
      });

      it('should GET all orders', async () => {
        const response = await fetch(`${API_BASE_URL}/orders`);
        expect(response.status).to.equal(200);
        const data = await response.json();
        expect(data).to.be.an('array');
        // Add more assertions to check the structure and content of the order data if needed
      });

      it('should DELETE an order', async () => {
        // First, create an order to delete (assuming a product exists)
        const sampleProductId = 1;
        const newOrder = { productId: sampleProductId, quantity: 1 };
        const postResponse = await fetch(`${API_BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        });
        const createdOrder = await postResponse.json();

        // Then, DELETE the order
        const deleteResponse = await fetch(
          `${API_BASE_URL}/orders/${createdOrder.id}`,
          {
            method: 'DELETE',
          },
        );
        expect(deleteResponse.status).to.equal(204);

        // Try to GET the deleted order - should return 404 Not Found
        const getResponse = await fetch(
          `${API_BASE_URL}/orders/${createdOrder.id}`,
        );
        expect(getResponse.status).to.equal(404);
      });
    });
  });

  if (testsFailed) {
    process.exit(1); // Exit with a non-zero code if any test failed
  }
}

runTests();
