import { DynamicModule, Global, Module } from "@nestjs/common";
import { ModuleOptions } from "./casl.types";
import { AbilityCheckerBuilder } from "./casl.wrapper";
import { PROVIDERS } from "./casl.constants";

@Global()
@Module({})
export class AuthoModule {
  static forRoot<JwtPayload>(
    options: ModuleOptions<JwtPayload>
  ): DynamicModule {
    options.userProperty = options.userProperty || "user";
    return {
      module: AuthoModule,
      imports: [options.PrismaModule],
      providers: [
        {
          provide: PROVIDERS.MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: PROVIDERS.PRISMA_SERVICE,
          useExisting: Reflect.getMetadata(
            "providers",
            options.PrismaModule
          )[0],
        },
        {
          provide: PROVIDERS.ABILITY_CHECKER_BUILDER,
          useClass: AbilityCheckerBuilder,
        },
      ],
      exports: [
        {
          provide: PROVIDERS.PRISMA_SERVICE,
          useExisting: Reflect.getMetadata(
            "providers",
            options.PrismaModule
          )[0],
        },
        {
          provide: PROVIDERS.ABILITY_CHECKER_BUILDER,
          useClass: AbilityCheckerBuilder,
        },
        {
          provide: PROVIDERS.MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
