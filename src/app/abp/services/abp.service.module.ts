import { NgModule } from '@angular/core';

import * as clients from './clients';

const _CLIENTS = [
    clients.AccountClient,
    clients.AuditLogClient,
    clients.CachingClient,
    clients.ChatClient,
    clients.CommonLookupClient,
    clients.ConfigurationClient,
    clients.DemoUiComponentsClient,
    clients.EditionClient,
    clients.FriendshipClient,
    clients.HostDashboardClient,
    clients.HostSettingsClient,
    clients.InstallClient,
    clients.InvoiceClient,
    clients.LanguageClient,
    clients.NotificationClient,
    clients.OrganizationUnitClient,
    clients.PaymentClient,
    clients.PermissionClient,
    clients.ProductServiceClient,
    clients.ProfileClient,
    clients.RoleClient,
    clients.SessionClient,
    clients.SubscriptionClient,
    clients.TenantClient,
    clients.TenantDashboardClient,
    clients.TenantRegistrationClient,
    clients.TenantSettingsClient,
    clients.TimingClient,
    clients.TokenAuthClient,
    clients.UiCustomizationSettingsClient,
    clients.UserClient,
    clients.UserLinkClient,
    clients.UserLoginClient,
    clients.WebLogClient,
    clients.WorkClient,
];

@NgModule({
    providers: [..._CLIENTS],
})

export class AbpServiceModule { }
