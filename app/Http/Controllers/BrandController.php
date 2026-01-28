<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class BrandController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:brand-view', only: ['index', 'show']),
            new Middleware('permission:brand-create', only: ['create', 'store']),
            new Middleware('permission:brand-edit', only: ['edit', 'update']),
            new Middleware('permission:brand-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $brands = Brand::latest()->paginate(10);
        return Inertia::render('brand/index', ['brands' => $brands]);
    }

    public function create()
    {
        return Inertia::render('brand/create');
    }

    public function store(StoreBrandRequest $request)
    {
        Brand::create($request->validated());
        return redirect()->route('brands.index')->with('success', 'Brand created successfully');
    }

    public function edit(Brand $brand)
    {
        return Inertia::render('brand/edit', ['brand' => $brand]);
    }

    public function update(UpdateBrandRequest $request, Brand $brand)
    {
        $brand->update($request->validated());
        return redirect()->route('brands.index')->with('success', 'Brand updated successfully');
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return redirect()->route('brands.index')->with('success', 'Brand deleted successfully');
    }
}
