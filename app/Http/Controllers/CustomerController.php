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
        $customers = Customer::latest()->paginate(10);
        return Inertia::render('customer/index', ['customers' => $customers]);
    }

    public function create()
    {
        return Inertia::render('customer/create');
    }

    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        return redirect()->route('customers.index')
            ->with('success', "Customer created successfully with code: {$customer->code}");
    }

    public function show(Customer $customer)
    {
        return Inertia::render('customer/show', ['customer' => $customer]);
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('customer/edit', ['customer' => $customer]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());
        return redirect()->route('customers.index')
            ->with('success', "Customer {$customer->code} updated successfully");
    }

    public function destroy(Customer $customer)
    {
        $code = $customer->code;
        $customer->delete();
        return redirect()->route('customers.index')
            ->with('success', "Customer {$code} deleted successfully");
    }
}
