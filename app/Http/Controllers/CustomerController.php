<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class CustomerController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:customer-view', only: ['index', 'show']),
            new Middleware('permission:customer-create', only: ['create', 'store']),
            new Middleware('permission:customer-edit', only: ['edit', 'update']),
            new Middleware('permission:customer-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $customers = Customer::latest()->get();
        return Inertia::render('customer/index', ['customers' => $customers]);
    }

    public function create()
    {
        return Inertia::render('customer/create');
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        $customer->logCreated();
        return redirect()->route('customers.index')
            ->with('success', "Customer created successfully with code: {$customer->code}");
    }

    public function show(Customer $customer)
    {
        $customer->load(['logs.user']);
        return Inertia::render('customer/show', ['customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('customer/edit', ['customer' => $customer]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $old = $customer->only($customer->getFillable());
        $customer->update($request->validated());
        $customer->logUpdated($old, $request->validated(), $request->input('update_remarks'));
        return redirect()->route('customers.index')
            ->with('success', "Customer {$customer->code} updated successfully");
    }

    public function destroy(Customer $customer)
    {
        $code = $customer->code;
        $customer->logDeleted();
        $customer->delete();
        return redirect()->route('customers.index')
            ->with('success', "Customer {$code} deleted successfully");
    }
}
