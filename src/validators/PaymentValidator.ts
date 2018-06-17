import Payment from "../models/Payment";
import User from "../models/User";
import ServiceError from "../utils/ServiceError";
import IValidator from "./IValidator";

export default class PaymentValidator implements IValidator<Payment> {
  public validateCreate(bodyData: Payment) {
    if (
      !bodyData.payer_id ||
      !bodyData.amount ||
      !bodyData.valid_until ||
      !bodyData.payment_type
    ) {
      throw new ServiceError(400, "Invalid POST data");
    }

    if (bodyData.id) {
      delete bodyData.id;
    }

    bodyData.created = new Date();
  }

  public validateUpdate(dataId: number, newData: Payment, validator: User) {
    return;
  }
}
