<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaterialRequest;
use App\Http\Requests\UpdateMaterialRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Material;
use App\Models\Uom;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class MaterialController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:material-view', only: ['index', 'show']),
            new Middleware('permission:material-create', only: ['create', 'store']),
            new Middleware('permission:material-edit', only: ['edit', 'update']),
            new Middleware('permission:material-delete', only: ['destroy']),
        ];
    }

    public function index()
    {
        $materials = Material::with(['brand', 'category', 'uom'])->latest()->paginate(10);
        return Inertia::render('material/index', ['materials' => $materials]);
    }

    public function create()
    {
        $brands = Brand::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $uoms = Uom::orderBy('acronym')->get();

        return Inertia::render('material/create', [
            'brands' => $brands,
            'categories' => $categories,
            'uoms' => $uoms,
        ]);
    }

    public function store(StoreMaterialRequest $request)
    {
        $material = Material::create($request->validated());
        $material->logCreated();
        return redirect()->route('materials.index')
            ->with('success', "Material created successfully with code: {$material->code}");
    }

    public function show(Material $material)
    {
        $material->load(['brand', 'category', 'uom', 'logs.user']);
        return Inertia::render('material/show', ['material' => $material]);
    }

    public function edit(Material $material)
    {
        $material->load(['brand', 'category', 'uom']);
        $brands = Brand::orderBy('name')->get();
        $categories = Category::orderBy('name')->get();
        $uoms = Uom::orderBy('acronym')->get();

        return Inertia::render('material/edit', [
            'material' => $material,
            'brands' => $brands,
            'categories' => $categories,
            'uoms' => $uoms,
        ]);
    }

    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $old = $material->only($material->getFillable());
        $material->update($request->validated());
        $material->logUpdated($old, $request->validated());

        return redirect()->route('materials.index')
            ->with('success', "Material {$material->code} updated successfully");
    }

    public function destroy(Material $material)
    {
        $code = $material->code;
        $material->logDeleted();
        $material->delete();
        return redirect()->route('materials.index')
            ->with('success', "Material {$code} deleted successfully");
    }
}
