// Bibliotecas
const request = require('supertest');
const { expect } = require('chai');

describe('Transfer Mutation - GraphQL', () => {

    let token;

     beforeEach(async () => {
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    query: `
                        mutation login($email: String!, $password: String!) {
                            login(email: $email, password: $password) {
                                token
                            }
                        }
                    `,
                    variables: {
                        email: "julio@abc.com",
                        password: "123456"
                    }
                })

        token = resposta.body.data?.login?.token;
        // console.log("Token retornado pelo login:", token);
        console.log("Resposta do login:", JSON.stringify(resposta.body, null, 2));

      })

     
    it('Quando informo dados válidos o registro do usuario é realizada com sucesso', async () => {
        const uniqueEmail = `julio${Date.now()}@abc.com`;
        
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`) // se a mutation exigir auth
            .send({
                query: `
                    mutation register($name: String!, $email: String!, $password: String!) {
                        register(name: $name, email: $email, password: $password) {
                            name
                            email
                            
                        }
                    }
                `,
                variables: {
                    name: "Julio",
                    email: uniqueEmail,
                    password: "123456"
                }
            })

        expect(resposta.status).to.be.equal(200)
        expect(resposta.body.data.register).to.have.property('name', 'Julio')
        expect(resposta.body.data.register).to.have.property('email', uniqueEmail)
                                            //
    });

    it('Deve realizar o checkout com sucesso usando o boleto', async () => {
              
        const resposta = await request('http://localhost:4000')
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`) 
            .send({
                query: `
                    mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!) {
            checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod) {
              freight
              items {
                productId
                quantity
              }
              paymentMethod
              userId
              valorFinal
            }
          }
        `,
        variables: {
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 }
          ],
          freight: 10,
          paymentMethod: "boleto"
        }
         });

      // console.log("Resposta GraphQL:", JSON.stringify(resposta.body, null, 2));

      expect(resposta.status).to.equal(200);
      const checkout = resposta.body.data.checkout;
      expect(checkout).to.have.property("freight", 10);
      expect(checkout).to.have.property("paymentMethod", "boleto");
      expect(checkout).to.have.property("userId");
      expect(checkout).to.have.property("valorFinal");
      expect(checkout.items).to.be.an("array").with.length(2);
      expect(checkout.items[0]).to.have.property("productId", 1);
      expect(checkout.items[0]).to.have.property("quantity", 2);
      expect(checkout.items[1]).to.have.property("productId", 2);
      expect(checkout.items[1]).to.have.property("quantity", 1);
    });

    it('Deve realizar checkout com cartão de crédito com sucesso', async () => {
      const resposta = await request('http://localhost:4000')
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({
         query: `
          mutation Checkout(
            $items: [CheckoutItemInput!]!,
            $freight: Float!,
            $paymentMethod: String!,
            $cardData: CardDataInput
          ) {
            checkout(
              items: $items,
              freight: $freight,
              paymentMethod: $paymentMethod,
              cardData: $cardData
            ) {
              valorFinal
              paymentMethod
              freight
              items {
                productId
                quantity
              }
            }
          }
        `,
        variables: {
          items: [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 }
          ],
          freight: 10,
          paymentMethod: "credit_card",
          cardData: {
            number: "4111111111111111",
            name: "Julio Costa",
            expiry: "12/30",
            cvv: "123"
          }
        }
      });

      // console.log("Resposta GraphQL:", JSON.stringify(resposta.body, null, 2));

      expect(resposta.status).to.equal(200);

      const checkout = resposta.body.data.checkout;
      expect(checkout).to.have.property("valorFinal");
      expect(checkout).to.have.property("paymentMethod", "credit_card");
      expect(checkout).to.have.property("freight", 10);
      expect(checkout.items).to.be.an("array").with.length(2);
      expect(checkout.items[0]).to.have.property("productId", 1);
      expect(checkout.items[0]).to.have.property("quantity", 2);
      expect(checkout.items[1]).to.have.property("productId", 2);
      expect(checkout.items[1]).to.have.property("quantity", 1);
    });

});
 
