import { Kafka, Producer, Message } from 'kafkajs';

let kafkaClient: Kafka | null;

export async function connectKafka(
  brokerList: string[],
  clientId: string
): Promise<Kafka | null> {
  try {
    if (kafkaClient) {
      return kafkaClient;
    }
    kafkaClient = new Kafka({
      clientId,
      brokers: brokerList,
    });
  } catch (err) {
    return null;
  }

  return kafkaClient;
}

export async function sendMessage(
  producer: Producer,
  topics: string[],
  messages: Message[],
  disconnectAfterSendingMessage: boolean = false
): Promise<void> {
  try {
    await producer.connect();

    topics.forEach((topic) => {
      producer.send({
        topic,
        messages,
      });
    });
  } catch (err) {
  } finally {
    if (disconnectAfterSendingMessage) {
      producer.disconnect();
    }
  }
}

export async function disconnectKafka(kafkaClient: Kafka): Promise<void> {
  try {
    const producer = kafkaClient.producer();
    await producer.disconnect();
    console.log('Kafka client disconnected successfully');
  } catch (err) {
    console.error(err);
  }
}
