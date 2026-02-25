<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        // 'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'active'])->group(function () {
    Route::get('password/change', [App\Http\Controllers\PasswordChangeController::class, 'index'])
        ->name('password.change');
    Route::post('password/change', [App\Http\Controllers\PasswordChangeController::class, 'update'])
        ->name('password.change.update');
});

Route::middleware(['auth', 'active', 'verified', 'password.changed'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('users', App\Http\Controllers\UserController::class);
    Route::resource('roles', App\Http\Controllers\RoleController::class);

    Route::get('preferences', [App\Http\Controllers\PreferenceController::class, 'index'])->name('preferences.index');
    Route::post('preferences', [App\Http\Controllers\PreferenceController::class, 'update'])->name('preferences.update');

    Route::resource('brands', App\Http\Controllers\BrandController::class);
    Route::resource('categories', App\Http\Controllers\CategoryController::class);
    Route::resource('uoms', App\Http\Controllers\UomController::class);
    Route::resource('locations', App\Http\Controllers\LocationController::class);
    Route::resource('charges', App\Http\Controllers\ChargeController::class);
    // Route::resource('currencies', App\Http\Controllers\CurrencyController::class);

    Route::resource('materials', App\Http\Controllers\MaterialController::class);
    Route::resource('vendors', App\Http\Controllers\VendorController::class);
    Route::resource('customers', App\Http\Controllers\CustomerController::class);

    Route::resource('inventories', App\Http\Controllers\InventoryController::class)->except(['edit', 'update']);

    Route::get('inventories/{inventory}/adjust',   [App\Http\Controllers\InventoryController::class, 'adjust'])->name('inventories.adjust');
    Route::post('inventories/{inventory}/adjust',  [App\Http\Controllers\InventoryController::class, 'processAdjust'])->name('inventories.adjust.process');
    Route::get('inventories/{inventory}/transfer',  [App\Http\Controllers\InventoryController::class, 'transfer'])->name('inventories.transfer');
    Route::post('inventories/{inventory}/transfer', [App\Http\Controllers\InventoryController::class, 'processTransfer'])->name('inventories.transfer.process');

    // Purchase Orders
    Route::resource('purchase-orders', App\Http\Controllers\PurchaseOrderController::class);
    Route::post('purchase-orders/{purchaseOrder}/post',   [App\Http\Controllers\PurchaseOrderController::class, 'post'])->name('purchase-orders.post');
    Route::post('purchase-orders/{purchaseOrder}/cancel', [App\Http\Controllers\PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel');
    Route::post('purchase-orders/{purchaseOrder}/revert', [App\Http\Controllers\PurchaseOrderController::class, 'revert'])->name('purchase-orders.revert');

    // Goods Receipts
    Route::resource('goods-receipts', App\Http\Controllers\GoodsReceiptController::class);
    Route::post('goods-receipts/{goodsReceipt}/complete', [App\Http\Controllers\GoodsReceiptController::class, 'complete'])->name('goods-receipts.complete');
    Route::post('goods-receipts/{goodsReceipt}/cancel',   [App\Http\Controllers\GoodsReceiptController::class, 'cancel'])->name('goods-receipts.cancel');
    Route::post('goods-receipts/{goodsReceipt}/revert',   [App\Http\Controllers\GoodsReceiptController::class, 'revert'])->name('goods-receipts.revert');

    // GR from PO
    Route::get('purchase-orders/{purchaseOrder}/goods-receipts/create', [App\Http\Controllers\GoodsReceiptController::class, 'create'])->name('purchase-orders.goods-receipts.create');

    // Sales Orders
    Route::resource('sales-orders', App\Http\Controllers\SalesOrderController::class);
    Route::post('sales-orders/{salesOrder}/post',   [App\Http\Controllers\SalesOrderController::class, 'post'])->name('sales-orders.post');
    Route::post('sales-orders/{salesOrder}/cancel', [App\Http\Controllers\SalesOrderController::class, 'cancel'])->name('sales-orders.cancel');
    Route::post('sales-orders/{salesOrder}/revert', [App\Http\Controllers\SalesOrderController::class, 'revert'])->name('sales-orders.revert');

    // Goods Issues
    Route::resource('goods-issues', App\Http\Controllers\GoodsIssueController::class);
    Route::post('goods-issues/{goodsIssue}/complete', [App\Http\Controllers\GoodsIssueController::class, 'complete'])->name('goods-issues.complete');
    Route::post('goods-issues/{goodsIssue}/cancel',   [App\Http\Controllers\GoodsIssueController::class, 'cancel'])->name('goods-issues.cancel');
    Route::post('goods-issues/{goodsIssue}/revert',   [App\Http\Controllers\GoodsIssueController::class, 'revert'])->name('goods-issues.revert');

    // GI from SO
    Route::get('sales-orders/{salesOrder}/goods-issues/create', [App\Http\Controllers\GoodsIssueController::class, 'create'])->name('sales-orders.goods-issues.create');

    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('purchase-order-reports', [App\Http\Controllers\AnalyticsController::class, 'purchaseOrderReports'])->name('purchase-orders');
        Route::get('sales-order-reports',    [App\Http\Controllers\AnalyticsController::class, 'salesOrderReports'])->name('sales-orders');
        Route::get('inventory-report',       [App\Http\Controllers\AnalyticsController::class, 'inventoryReport'])->name('inventory');
    });

    Route::prefix('activity')->name('activity.')->group(function () {
        Route::get('transaction-log', [App\Http\Controllers\ActivityController::class, 'transactionLog'])->name('transaction-log');
        Route::get('inventory-log',   [App\Http\Controllers\ActivityController::class, 'inventoryLog'])->name('inventory-log');
    });


    // Private file access
    Route::get('file', [App\Http\Controllers\FileController::class, 'show'])->name('file.show');
});

require __DIR__.'/settings.php';
