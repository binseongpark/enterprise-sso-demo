/**
 * 메모 CRUD API
 * 
 * Supabase를 통해 메모를 생성, 조회, 수정, 삭제합니다.
 * RLS 정책이 자동으로 적용됩니다.
 */

import { NextResponse } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase';
import { getUserFromRequest, hasRoleInToken, getTokenFromRequest } from '@/lib/auth';

// GET: 메모 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    const supabase = createClientFromRequest(request);

    // Admin이고 all=true인 경우 모든 메모 조회
    if (all && hasRoleInToken(token, 'admin')) {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('메모 조회 실패:', error);
        return NextResponse.json(
          { error: '메모를 조회하는데 실패했습니다.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ notes: notes || [] });
    }

    // 사용자 자신의 메모만 조회 (RLS 정책 자동 적용)
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('메모 조회 실패:', error);
      return NextResponse.json(
        { error: '메모를 조회하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('GET /api/notes 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 메모 생성
export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, is_public } = body;

    if (!title) {
      return NextResponse.json(
        { error: '제목은 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = createClientFromRequest(request);

    // 사용자 프로필 ID 가져오기
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('keycloak_sub', user.sub)
      .single();

    if (profileError || !profile) {
      console.error('프로필 조회 실패:', profileError);
      return NextResponse.json(
        { error: '사용자 프로필을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 메모 생성 (RLS 정책 자동 적용)
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: profile.id,
        title,
        content: content || null,
        is_public: is_public || false,
      })
      .select()
      .single();

    if (error) {
      console.error('메모 생성 실패:', error);
      return NextResponse.json(
        { error: '메모를 생성하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('POST /api/notes 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 메모 수정
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '메모 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, is_public } = body;

    if (!title) {
      return NextResponse.json(
        { error: '제목은 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = createClientFromRequest(request);

    // 메모 수정 (RLS 정책으로 자동으로 본인 메모만 수정 가능)
    const { data: note, error } = await supabase
      .from('notes')
      .update({
        title,
        content: content || null,
        is_public: is_public || false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('메모 수정 실패:', error);
      return NextResponse.json(
        { error: '메모를 수정하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { error: '메모를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('PUT /api/notes 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 메모 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '메모 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const supabase = createClientFromRequest(request);

    // 메모 삭제 (RLS 정책으로 자동으로 본인 메모만 삭제 가능)
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('메모 삭제 실패:', error);
      return NextResponse.json(
        { error: '메모를 삭제하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/notes 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
