<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {

        if (Auth::user()->role === 'admin') {
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'ဝင်ရောက်ခွင့်မရှိပါ။ သင်သည် Admin မဟုတ်ပါဗျာ။'
        ], 403);
    }
}
