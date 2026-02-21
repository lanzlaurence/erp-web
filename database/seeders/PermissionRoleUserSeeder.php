<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionRoleUserSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'role-view',
            'role-create',
            'role-edit',
            'role-delete',
            'user-view',
            'user-create',
            'user-edit',
            'user-delete',
            'preference-view',
            'preference-edit',
            'brand-view',
            'brand-create',
            'brand-edit',
            'brand-delete',
            'category-view',
            'category-create',
            'category-edit',
            'category-delete',
            'uom-view',
            'uom-create',
            'uom-edit',
            'uom-delete',
            'location-view',
            'location-create',
            'location-edit',
            'location-delete',
            'material-view',
            'material-create',
            'material-edit',
            'material-delete',
            'vendor-view',
            'vendor-create',
            'vendor-edit',
            'vendor-delete',
            'customer-view',
            'customer-create',
            'customer-edit',
            'customer-delete',
            'charge-view',
            'charge-create',
            'charge-edit',
            'charge-delete',
            'currency-view',
            'currency-create',
            'currency-edit',
            'currency-delete',
            'inventory-view',
            'inventory-create',
            'inventory-adjust',
            'inventory-transfer',
            'inventory-delete',
            'po-view',
            'po-create',
            'po-edit',
            'po-delete',
            'po-post',
            'po-cancel',
            'po-revert',
            'gr-view',
            'gr-create',
            'gr-edit',
            'gr-delete',
            'gr-cancel',
            'gr-complete',
            'gr-revert',
            'activity-transaction-log',
            'activity-inventory-log',
            'analytics-purchase-order-report',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Admin role and assign all permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Create Admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('P@ssw0rd'),
            'force_password_change' => false,
            'is_active' => true,
        ])->assignRole('Admin');
    }
}
