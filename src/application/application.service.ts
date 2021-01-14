import { CreateApplicationDto } from './dto/create-application.dto';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Application, ApplicationDocument } from './application.schema';
import { isValidObjectId, Model } from 'mongoose';
import { v4 as generateUUID } from 'uuid';
import { AuthorizedUser } from 'src/user/interface/user.interface';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger('application');

  // private readonly applicationRepository: UserRepository,
  constructor(@InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>) {}

  async create(createApplicationDto: CreateApplicationDto, authorizedUser: AuthorizedUser): Promise<Application> {
    try {
      const clientId = generateUUID();
      const clientSecret = generateUUID();
      const creationDate = new Date();
      const newApplication = new this.applicationModel({
        ...createApplicationDto,
        clientId,
        clientSecret,
        creationDate,
        admin: authorizedUser.id,
      });

      await newApplication.save();
      return newApplication;
    } catch (e) {
      this.logger.error(e);
      throw new ConflictException(e.message);
    }
  }

  findAll() {
    return this.applicationModel.find();
  }

  async findOneById(id: string) {
    if (isValidObjectId(id)) {
      const item = await this.applicationModel.findOne({ _id: id });
      return item;
    } else {
      throw new BadRequestException();
    }
  }

  //   update(id: number, updateApplicationDto: UpdateApplicationDto) {
  //     return `This action updates a #${id} application`;
  //   }

  remove(id: string) {
    return this.applicationModel.deleteOne({ _id: id });
  }
}