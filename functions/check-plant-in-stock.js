import request from 'request';
import { SNS } from 'aws-sdk';

const { PLANT_IN_STOCK_TOPIC, PLANT_URL } = process.env;

export async function handler() {
  const data = await requestPromise(PLANT_URL);
  const inStock = parseInt(data.split('availability-only">\n\n')[1].split('<br>')[0]);
  console.log(`Found ${inStock} in stock`);
  if (inStock > 0) {
    await sendPlantInStockNotification(inStock);
  }
}

async function sendPlantInStockNotification(inStock) {
  const sns = new SNS();
  const { MessageId } = await sns
    .publish({
      TopicArn: PLANT_IN_STOCK_TOPIC,
      Message: `Saw ${inStock} in stock of plant at url: ${PLANT_URL}`,
    })
    .promise();
  console.log(`Sent plant in stock notification with messageId ${MessageId}`);
}

async function requestPromise(url) {
  return new Promise(function(resolve, reject) {
    request(url, function(error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}
