import crypto from "crypto";
import sha1 from "sha1";
import UserDao from "../dao/UserDao";
import IUserDatabaseObject, { IUserPaymentDatabaseObject } from "../interfaces/IUserDatabaseObject";
import User from "../models/User";
import { UserPayment } from "../models/UserPayment";

import ServiceError from "../utils/ServiceError";
import { validatePassword } from "./AuthenticationService";

export default class UserService {
  constructor(private readonly userDao: UserDao) {}

  public async fetchUser(userId: number): Promise<User> {
    const result: IUserDatabaseObject = await this.userDao.findOne(userId);
    if (!result) {
      throw new ServiceError(404, "User not found");
    }

    return new User(result);
  }

  public async fetchAllUsers(): Promise<User[]> {
    const results: IUserDatabaseObject[] = await this.userDao.findAll();
    return results.map((dbObj: IUserDatabaseObject) => new User(dbObj));
  }

  public async fetchAllUnpaidUsers(): Promise<User[]> {
    const results: IUserDatabaseObject[] = await this.userDao.findAllByUnpaidPayment();
    return results.map((dbObj: IUserDatabaseObject) => new User(dbObj));
  }

  /**
   * Searches all users with the given SQL WHERE condition.
   */
  public async searchUsers(searchTerm: string): Promise<User[]> {
    const results: IUserDatabaseObject[] = await this.userDao.findWhere(searchTerm);
    if (!results.length) {
      throw new ServiceError(404, "No results returned");
    }

    return results.map((res: IUserDatabaseObject) => new User(res));
  }

  /**
   * Fetches users with selected fields and those who match the conditions.
   */
  public async fetchAllWithSelectedFields(fields: string[], conditions?: string[]): Promise<UserPayment[]> {
    let conditionQuery: string[] = null;
    if (conditions) {
      conditionQuery = [];
      conditions.forEach((condition: string) => {
        switch (condition) {
          case "member":
            conditionQuery.push("membership <> 'ei-jasen'");
            break;
          case "nonmember":
            conditionQuery.push("membership = 'ei-jasen'");
            break;
          case "paid":
            conditionQuery.push("paid is not null");
            break;
          case "nonpaid":
            conditionQuery.push("(paid is null)");
            break;
          case "revoked":
            conditionQuery.push("deleted = 1");
            break;
          default:
            break;
        }
      });
    }

    const results: IUserPaymentDatabaseObject[] = await this.userDao.findAll(fields, conditionQuery);
    if (!results.length) {
      throw new ServiceError(404, "No results returned");
    }

    return results.map((u: IUserPaymentDatabaseObject) => new UserPayment(u));
  }

  public async getUserWithUsernameAndPassword(username: string, password: string): Promise<User> {
    const dbUser: IUserDatabaseObject = await this.userDao.findByUsername(username);
    if (!dbUser) {
      throw new ServiceError(404, "User not found");
    }

    const user: User = new User(dbUser);
    const isPasswordCorrect: boolean = await validatePassword(password, user.salt, user.hashedPassword);
    if (isPasswordCorrect) {
      return user;
    }

    throw new ServiceError(401, "Invalid username or password");
  }

  public async checkUsernameAvailability(username: string): Promise<boolean> {
    const user: IUserDatabaseObject = await this.userDao.findByUsername(username);
    return user === undefined;
  }

  public async checkEmailAvailability(email: string): Promise<boolean> {
    const user: IUserDatabaseObject = await this.userDao.findByEmail(email);
    return user === undefined;
  }

  public async createUser(user: User, rawPassword: string): Promise<number> {
    let newUser: User = new User({});
    const { password, salt } = await mkHashedPassword(rawPassword);
    newUser = Object.assign(newUser, user);
    user.hashedPassword = password;
    user.salt = salt;
    const insertIds: number[] = await this.userDao.save(newUser.getDatabaseObject());
    return insertIds[0];
  }

  public async updateUser(userId: number, udpatedUser: User, password?: string): Promise<number> {
    let newUser: User = new User({});
    newUser = Object.assign(newUser, udpatedUser);
    const affectedRows: number = await this.userDao.update(userId, newUser.getDatabaseObject());

    return affectedRows;
  }

  public async deleteUser(userId: number): Promise<boolean> {
    return this.userDao.remove(userId);
  }
}

async function mkHashedPassword(rawPassword: string): Promise<{ salt: string; password: string }> {
  const salt = crypto.randomBytes(16).toString("hex");
  // The passwords are first hashed according to the legacy format
  // to ensure backwards compability
  const password = sha1(`${salt}kekbUr${rawPassword}`) as string;
  return { salt, password };
}
