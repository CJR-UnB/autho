import {
  CanActivate,
  ExecutionContext,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import {
  AbilityCheckerBuilderInterface,
  AbilityMetadata,
  ModuleOptions,
} from "../casl.types";
import { Reflector } from "@nestjs/core";
import { subject } from "@casl/ability";
import { PrismaClient } from "@prisma/client";
import { ABILITY_METADATA, PROVIDERS } from "../casl.constants";

export class AbilityGuard implements CanActivate {
  constructor(
    @Inject(PROVIDERS.ABILITY_CHECKER_BUILDER)
    private readonly abilityCheckerBuilder: AbilityCheckerBuilderInterface,
    @Inject(PROVIDERS.MODULE_OPTIONS)
    private readonly moduleOptions: ModuleOptions<any>,
    @Inject(PROVIDERS.PRISMA_SERVICE)
    private readonly prismaService: PrismaClient,
    @Inject(Reflector) private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request[this.moduleOptions.userProperty];

    const { action, resourceName, possession, resourceParamName } =
      this.reflector.get(
        ABILITY_METADATA,
        context.getHandler()
      ) as AbilityMetadata;

    const resourceId: number = +request.params[resourceParamName];

    const resource =
      possession === "own"
        ? await (this.prismaService[resourceName].findUnique as any)({
            where: { id: resourceId },
          })
        : resourceId;

    if (!resource) throw new NotFoundException(`${resourceName} not found`);

    const abilityChecker = this.abilityCheckerBuilder.buildFor(user);

    return abilityChecker.can(action, subject(resourceName, resource));
  }
}
