import * as Express from "express";
import PrivacyPolicyDao from "../dao/PrivacyPolicyDao";
import IController from "../interfaces/IController";
import IPrivacyPolicy from "../interfaces/IPrivacyPolicy";
import ServiceResponse from "../utils/ServiceResponse";

/**
 * Privacy Policy controller.
 *
 * @export
 * @class PrivacyPolicyController
 * @implements {IController}
 */
export default class PrivacyPolicyController implements IController {
  /**
   * Router
   *
   * @private
   * @type {express.Router}
   * @memberof PaymentController
   */
  private route: Express.Router;

  /**
   * Creates an instance of PrivacyPolicyController.
   * @memberof PrivacyPolicyController
   */
  constructor(private readonly privacyPolicyDao: PrivacyPolicyDao) {
    this.route = Express.Router();
  }

  /**
   * Returns a privacy policy.
   *
   * @param {Express.Request} req
   * @param {Express.Response} res
   * @returns {Promise<Express.Response>}
   * @memberof PrivacyPolicyController
   */
  public async GetPrivacyPolicy(
    req: Express.Request,
    res: Express.Response
  ): Promise<Express.Response | void> {
    try {
      const privacyPolicy: IPrivacyPolicy = await this.privacyPolicyDao.findByName(
        req.params.policy
      );
      if (privacyPolicy) {
        return res
          .status(200)
          .json(new ServiceResponse(privacyPolicy, "Success", true));
      } else {
        return res
          .status(404)
          .json(new ServiceResponse(null, "Privacy policy not found", false));
      }
    } catch (err) {
      return res
        .status(500)
        .json(new ServiceResponse(null, "Server error", false));
    }
  }

  /**
   * Creates routes
   *
   * @returns {Express.Router}
   * @memberof PrivacyPolicyController
   */
  public createRoutes(): Express.Router {
    this.route.get("/:policy", this.GetPrivacyPolicy.bind(this));

    return this.route;
  }
}
