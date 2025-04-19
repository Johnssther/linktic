/**
 * In the future, this function can be used to emit events to an inventory microservice
 * or a messaging system like RabbitMQ or Kafka.  
 * 
 * @param productId 
 * @param qty 
 */

export function emitInventoryChangeEvent(productId: number, qty: number) {
  console.log(`[EVENT] Inventario actualizado: producto ${productId}, nueva cantidad: ${qty}`);
}
