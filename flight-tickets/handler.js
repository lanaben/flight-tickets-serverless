'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://127.0.0.1:4566', // Localstack DynamoDB endpoint
  region: 'us-east-1'
});

const TABLE_NAME = process.env.TICKET_TABLE

// Create Ticket
module.exports.createTicket = async (ticket) => {
  const { title, description, date } = JSON.parse(ticket.body);
  const id = uuid.v4();
  const newTicket = { id, title, description, date };
  await docClient.put({
    TableName: TABLE_NAME,
    Item: newTicket
  }).promise();
  return {
    statusCode: 201,
    body: JSON.stringify(newTicket)
  };
};

// Get All Tickets
module.exports.getTickets = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items)
  };
};

// Get Ticket by ID
module.exports.getTicketById = async (ticket) => {
  const { id } = ticket.pathParameters;
  const data = await docClient.get({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Ticket not found' })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  };
};

// Update Ticket
module.exports.updateTicket = async (ticket) => {
  const { id } = ticket.pathParameters;
  const { title, description, date } = JSON.parse(ticket.body);
  await docClient.update({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set title = :title, description = :description, date = :date',
    ExpressionAttributeValues: {
      ':title': title,
      ':description': description,
      ':date': date
    }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ id, title, description, date })
  };
};

// Delete Ticket
module.exports.deleteTicket = async (ticket) => {
  const { id } = ticket.pathParameters;
  await docClient.delete({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'ticket deleted successfully' })
  };
};