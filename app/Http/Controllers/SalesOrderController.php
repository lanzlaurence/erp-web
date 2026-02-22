<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSalesOrderRequest;
use App\Http\Requests\UpdateSalesOrderRequest;
use App\Models\Charge;
use App\Models\Customer;
use App\Models\Material;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalesOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:sales-order-view',   only: ['index', 'show']),
            new Middleware('permission:sales-order-create', only: ['create', 'store']),
            new Middleware('permission:sales-order-edit',   only: ['edit', 'update']),
            new Middleware('permission:sales-order-delete', only: ['destroy']),
            new Middleware('permission:sales-order-post',   only: ['post']),
            new Middleware('permission:sales-order-cancel', only: ['cancel']),
            new Middleware('permission:sales-order-revert', only: ['revert']),
        ];
    }

    public function index()
    {
        $sos = SalesOrder::with(['customer', 'user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('sales/sales-order/index', [
            'salesOrders' => $sos,
        ]);
    }

    public function create()
    {
        $customers = Customer::where('status', 'active')->get();
        $materials = Material::where('status', 'active')
            ->with(['brand', 'category', 'uom'])
            ->get();
        $charges = Charge::where('status', 'active')->get();

        return Inertia::render('sales/sales-order/create', [
            'customers' => $customers,
            'materials' => $materials,
            'charges'   => $charges,
        ]);
    }

    public function store(StoreSalesOrderRequest $request)
    {
        DB::transaction(function () use ($request) {
            $so = SalesOrder::create([
                'customer_id'    => $request->customer_id,
                'user_id'        => Auth::id(),
                'status'         => 'draft',
                'order_date'     => $request->order_date,
                'delivery_date'  => $request->delivery_date,
                'reference_no'   => $request->reference_no,
                'discount_type'  => $request->discount_type,
                'discount_amount'=> $request->discount_amount ?? 0,
                'remarks'        => $request->remarks,
            ]);

            $this->syncItems($so, $request->items);
            $this->syncCharges($so, $request->charges ?? []);
            $this->recalculateTotals($so);

            $so->logs()->create([
                'user_id'   => Auth::id(),
                'action'    => 'created',
                'to_status' => 'draft',
                'remarks'   => 'Sales order created',
            ]);
        });

        return redirect()->route('sales-orders.index')
            ->with('success', 'Sales order created successfully.');
    }

    public function show(SalesOrder $salesOrder)
    {
        $salesOrder->load([
            'customer', 'user',
            'items.material',
            'charges.charge',
            'goodsIssues.location',
            'goodsIssues.user',
            'logs.user',
        ]);

        return Inertia::render('sales/sales-order/show', [
            'salesOrder' => $salesOrder,
        ]);
    }

    public function edit(SalesOrder $salesOrder)
    {
        if (!$salesOrder->canBeEdited()) {
            return redirect()->route('sales-orders.show', $salesOrder->id)
                ->withErrors(['error' => 'Only draft sales orders can be edited.']);
        }

        $customers = Customer::where('status', 'active')->get();
        $materials = Material::where('status', 'active')
            ->with(['brand', 'category', 'uom'])
            ->get();
        $charges = Charge::where('status', 'active')->get();

        $salesOrder->load(['customer', 'items.material', 'charges']);

        return Inertia::render('sales/sales-order/edit', [
            'salesOrder' => $salesOrder,
            'customers'  => $customers,
            'materials'  => $materials,
            'charges'    => $charges,
        ]);
    }

    public function update(UpdateSalesOrderRequest $request, SalesOrder $salesOrder)
    {
        if (!$salesOrder->canBeEdited()) {
            return redirect()->route('sales-orders.show', $salesOrder->id)
                ->withErrors(['error' => 'Only draft sales orders can be edited.']);
        }

        DB::transaction(function () use ($request, $salesOrder) {
            $salesOrder->update([
                'customer_id'    => $request->customer_id,
                'order_date'     => $request->order_date,
                'delivery_date'  => $request->delivery_date,
                'reference_no'   => $request->reference_no,
                'discount_type'  => $request->discount_type,
                'discount_amount'=> $request->discount_amount ?? 0,
                'remarks'        => $request->remarks,
            ]);

            $this->syncItems($salesOrder, $request->items);
            $this->syncCharges($salesOrder, $request->charges ?? []);
            $this->recalculateTotals($salesOrder);

            $salesOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'updated',
                'from_status' => $salesOrder->status,
                'to_status'   => $salesOrder->status,
                'remarks'     => 'Sales order updated',
            ]);
        });

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order updated successfully.');
    }

    public function destroy(SalesOrder $salesOrder)
    {
        if ($salesOrder->status !== 'draft') {
            return redirect()->route('sales-orders.index')
                ->withErrors(['error' => 'Only draft sales orders can be deleted.']);
        }

        $salesOrder->delete();

        return redirect()->route('sales-orders.index')
            ->with('success', 'Sales order deleted successfully.');
    }

    // ── Status Actions ────────────────────────────────────────────────────────

    public function post(SalesOrder $salesOrder)
    {
        if (!$salesOrder->canBePosted()) {
            return back()->withErrors(['error' => 'Sales order cannot be posted.']);
        }

        DB::transaction(function () use ($salesOrder) {
            $salesOrder->update(['status' => 'posted']);
            $salesOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'posted',
                'from_status' => 'draft',
                'to_status'   => 'posted',
                'remarks'     => 'Sales order posted',
            ]);
        });

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order posted successfully.');
    }

    public function cancel(SalesOrder $salesOrder)
    {
        if (!$salesOrder->canBeCancelled()) {
            return back()->withErrors(['error' => 'Sales order cannot be cancelled.']);
        }

        DB::transaction(function () use ($salesOrder) {
            $fromStatus = $salesOrder->status;
            $salesOrder->update(['status' => 'cancelled']);
            $salesOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'cancelled',
                'from_status' => $fromStatus,
                'to_status'   => 'cancelled',
                'remarks'     => 'Sales order cancelled',
            ]);
        });

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order cancelled.');
    }

    public function revert(SalesOrder $salesOrder)
    {
        if (!$salesOrder->canBeReverted()) {
            return back()->withErrors(['error' => 'Only posted sales orders can be reverted to draft.']);
        }

        DB::transaction(function () use ($salesOrder) {
            $salesOrder->update(['status' => 'draft']);
            $salesOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'reverted',
                'from_status' => 'posted',
                'to_status'   => 'draft',
                'remarks'     => 'Sales order reverted to draft',
            ]);
        });

        return redirect()->route('sales-orders.show', $salesOrder->id)
            ->with('success', 'Sales order reverted to draft.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function syncItems(SalesOrder $so, array $items): void
    {
        $so->items()->delete();

        foreach ($items as $index => $item) {
            $unitPrice    = (float) $item['unit_price'];
            $qty          = (float) $item['qty_ordered'];
            $discountType = $item['discount_type'] ?? null;
            $discountAmt  = (float) ($item['discount_amount'] ?? 0);
            $isVatable    = (bool) ($item['is_vatable'] ?? false);
            $vatType      = $item['vat_type'] ?? 'exclusive';
            $vatRate      = (float) ($item['vat_rate'] ?? 12);

            $unitAfterDiscount = $unitPrice;
            if ($discountType === 'fixed') {
                $unitAfterDiscount = max(0, $unitPrice - $discountAmt);
            } elseif ($discountType === 'percentage') {
                $unitAfterDiscount = $unitPrice * (1 - ($discountAmt / 100));
            }

            $netPrice = $unitAfterDiscount * $qty;
            $vatPrice = 0;
            if ($isVatable) {
                if ($vatType === 'exclusive') {
                    $vatPrice = $netPrice * ($vatRate / 100);
                } else {
                    $vatPrice = $netPrice - ($netPrice / (1 + ($vatRate / 100)));
                }
            }

            $grossPrice = $vatType === 'exclusive' ? $netPrice + $vatPrice : $netPrice;

            $so->items()->create([
                'material_id'               => $item['material_id'],
                'line_number'               => $index + 1,
                'qty_ordered'               => $qty,
                'qty_issued'                => 0,
                'unit_price'                => $unitPrice,
                'discount_type'             => $discountType,
                'discount_amount'           => $discountAmt,
                'unit_price_after_discount' => $unitAfterDiscount,
                'net_price'                 => $netPrice,
                'is_vatable'                => $isVatable,
                'vat_type'                  => $vatType,
                'vat_rate'                  => $vatRate,
                'vat_price'                 => $vatPrice,
                'gross_price'               => $grossPrice,
                'remarks'                   => $item['remarks'] ?? null,
            ]);
        }
    }

    private function syncCharges(SalesOrder $so, array $charges): void
    {
        $so->charges()->delete();

        foreach ($charges as $chargeData) {
            $charge = Charge::find($chargeData['charge_id']);
            if (!$charge) continue;

            $so->charges()->create([
                'charge_id'       => $charge->id,
                'name'            => $charge->name,
                'type'            => $charge->type,
                'value_type'      => $charge->value_type,
                'value'           => $charge->value,
                'computed_amount' => 0,
            ]);
        }
    }

    private function recalculateTotals(SalesOrder $so): void
    {
        $so->refresh();
        $items = $so->items;

        $totalGross = $items->sum(fn($i) => (float)$i->gross_price);

        $headerDiscountTotal = 0;
        if ($so->discount_type === 'fixed') {
            $headerDiscountTotal = (float) $so->discount_amount;
        } elseif ($so->discount_type === 'percentage') {
            $headerDiscountTotal = $totalGross * ((float)$so->discount_amount / 100);
        }

        $afterHeaderDiscount = $totalGross - $headerDiscountTotal;

        $totalCharges = 0;
        foreach ($so->charges as $soCharge) {
            $computed = $soCharge->value_type === 'fixed'
                ? (float) $soCharge->value
                : $afterHeaderDiscount * ((float)$soCharge->value / 100);

            $soCharge->update(['computed_amount' => $computed]);
            $totalCharges += $soCharge->type === 'tax' ? $computed : -$computed;
        }

        $grandTotal = $afterHeaderDiscount + $totalCharges;

        $so->update([
            'total_before_discount' => $items->sum(fn($i) => (float)$i->unit_price * (float)$i->qty_ordered),
            'total_item_discount'   => $items->sum(fn($i) => ((float)$i->unit_price - (float)$i->unit_price_after_discount) * (float)$i->qty_ordered),
            'total_net_price'       => $items->sum(fn($i) => (float)$i->net_price),
            'total_vat'             => $items->sum(fn($i) => (float)$i->vat_price),
            'total_gross'           => $totalGross,
            'header_discount_total' => $headerDiscountTotal,
            'total_charges'         => $totalCharges,
            'grand_total'           => $grandTotal,
        ]);
    }

    private function recalculateSoStatus(SalesOrder $so): void
    {
        $so->refresh();

        foreach ($so->items as $soItem) {
            $totalIssued = \App\Models\GoodsIssueItem::whereHas('goodsIssue', function ($q) use ($so) {
                    $q->where('sales_order_id', $so->id)
                    ->where('status', 'completed');
                })
                ->where('sales_order_item_id', $soItem->id)
                ->sum('qty_to_issue');

            $soItem->update(['qty_issued' => $totalIssued]);
        }

        $so->refresh();

        $allFull     = $so->items->every(fn($i) => (float)$i->qty_issued >= (float)$i->qty_ordered);
        $anyIssued   = $so->items->some(fn($i)  => (float)$i->qty_issued > 0);

        if ($so->status === 'cancelled') return;

        if ($allFull) {
            $so->update(['status' => 'fully_issued']);
        } elseif ($anyIssued) {
            $so->update(['status' => 'partially_issued']);
        } else {
            $so->update(['status' => 'posted']);
        }

        $so->logs()->create([
            'user_id' => Auth::id(),
            'action'  => 'status_recalculated',
            'remarks' => "SO status recalculated to {$so->fresh()->status}",
        ]);
    }
}
