<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use Illuminate\Http\Request;

class SliderController extends Controller
{
    // Public: Get active sliders for homepage
    public function index()
    {
        $sliders = Slider::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($sliders);
    }

    // Admin: Get all sliders
    public function indexAdmin()
    {
        $sliders = Slider::orderBy('sort_order', 'asc')->get();
        return response()->json($sliders);
    }

    // Admin: Create slider
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'image' => 'nullable|image|max:10240',
        ]);

        $slider = Slider::create($validated);

        if ($request->hasFile('image')) {
            $slider->addMedia($request->file('image'))
                ->toMediaCollection('slider_image');
        }

        return response()->json($slider, 201);
    }

    // Admin: Update slider
    public function update(Request $request, Slider $slider)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'button_text' => 'nullable|string|max:255',
            'button_link' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'image' => 'nullable|image|max:10240',
        ]);

        $slider->update($validated);

        if ($request->hasFile('image')) {
            $slider->clearMediaCollection('slider_image');
            $slider->addMedia($request->file('image'))
                ->toMediaCollection('slider_image');
        }

        return response()->json($slider);
    }

    // Admin: Delete slider
    public function destroy(Slider $slider)
    {
        $slider->delete();
        return response()->json(null, 204);
    }
}
