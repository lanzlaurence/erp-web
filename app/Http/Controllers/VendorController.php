<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Models\Vendor;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class VendorController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:vendor-view', only: ['index', 'show']),
            new Middleware('permission:vendor-create', only: ['create', 'store']),
            new Middleware('permission:vendor-edit', only: ['edit', 'update']),
            new Middleware('permission:vendor-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $vendors = Vendor::latest()->paginate(10);
        return Inertia::render('vendor/index', ['vendors' => $vendors]);
    }

    public function create()
    {
        return Inertia::render('vendor/create');
    }

    public function store(StoreVendorRequest $request)
    {
        $vendor = Vendor::create($request->validated());
        return redirect()->route('vendors.index')
            ->with('success', "Vendor created successfully with code: {$vendor->code}");
    }

    public function edit(Vendor $vendor)
    {
        return Inertia::render('vendor/edit', ['vendor' => $vendor]);
    }

    public function update(UpdateVendorRequest $request, Vendor $vendor)
    {
        $vendor->update($request->validated());
        return redirect()->route('vendors.index')
            ->with('success', "Vendor {$vendor->code} updated successfully");
    }

    public function destroy(Vendor $vendor)
    {
        $code = $vendor->code;
        $vendor->delete();
        return redirect()->route('vendors.index')
            ->with('success', "Vendor {$code} deleted successfully");
    }
}
